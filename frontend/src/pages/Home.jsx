import { useEffect, useState } from 'react';
import api from '../api';
import Hero from '../components/Hero';
import StatsRow from '../components/StatsRow';
import RoadmapSection from '../components/RoadmapSection';
import ExploreSection from '../components/ExploreSection';
import GetInvolvedSection from '../components/GetInvolvedSection';
import GalleryGrid from '../components/GalleryGrid';
import SanctuaryMap from '../components/SanctuaryMap';

const Home = () => {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await api.get('/api/campaign/');
        setCampaign(res.data);
      } catch (err) {
        console.error('Campaign sync error:', err);
      }
    };

    fetchCampaign();
    // Poll every 30 seconds for live-feeling stats AND roadmap updates
    const interval = setInterval(fetchCampaign, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Hero />
      {campaign && (
        <StatsRow
          raised={campaign.raised_usd}
          goal={campaign.goal_usd}
          trees={campaign.trees_pledged}
          days={campaign.days_left}
        />
      )}
      <RoadmapSection milestones={campaign?.roadmap || []} />
      <ExploreSection />
      <GetInvolvedSection />
      <GalleryGrid />
      <SanctuaryMap />
    </div>
  );
};

export default Home;
